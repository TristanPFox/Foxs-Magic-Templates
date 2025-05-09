import { createContext, useContext, useEffect, useLayoutEffect, useState, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return authContext;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Initially loading to check token
  let refreshPromise: Promise<string | void> | null = null; // Shared promise to prevent duplicate refresh calls

  /**
   * Function to refresh the access token.
   */
  const refreshAccessToken = async () => {
    if (!refreshPromise) {
      refreshPromise = axios
        .post(`/api/refresh`, {}, { withCredentials: true }) // Use HttpOnly cookie
        .then((response) => {
          setToken(response.data.access_token); // Store token in memory
          return response.data.access_token;
        })
        .catch((error) => {
          setToken(null); // Clear token if refresh fails
          throw error;
        })
        .finally(() => {
          refreshPromise = null; // Reset promise after refresh completes
        });
    }
    return refreshPromise;
  };

  /**
   * Rehydrate authentication on app load using the refresh token (via HttpOnly cookie).
   */
  useEffect(() => {
    const rehydrateAuth = async () => {
      try {
        await refreshAccessToken(); // Attempt to refresh using the HttpOnly cookie
      } catch {
        console.error('Rehydration failed');
        setToken(null);
      } finally {
        setIsLoading(false); // End loading
      }
    };

    rehydrateAuth();
  }, []);

  /**
   * Attach the access token to all Axios requests via an interceptor.
   */
  useLayoutEffect(() => {
    const authInterceptor = axios.interceptors.request.use((config) => {
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.withCredentials = true; // Ensure cookies are sent with requests
      return config;
    });

    return () => {
      axios.interceptors.request.eject(authInterceptor);
    };
  }, [token]);

  /**
   * Handle token expiration and refresh the token when needed.
   */
  useLayoutEffect(() => {
    const refreshInterceptor = axios.interceptors.response.use(
      (response) => response, // Pass through successful responses
      async (error) => {
        const originalRequest = error.config;

        // If refresh request itself fails, stop
        if (originalRequest.url?.endsWith('/api/refresh')) {
          setToken(null);
          setIsLoading(false);
          return Promise.reject(error);
        }

        // Prevent infinite retry loops
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await refreshAccessToken(); // Refresh token
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest); // Retry the original request
            }
          } catch (refreshError) {
            setToken(null); // Clear token on refresh failure
            setIsLoading(false);
            return Promise.reject(refreshError); // Reject the request
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(refreshInterceptor);
    };
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider value={{ token, setToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};