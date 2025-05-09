import {
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../AuthProvider';
import classes from './AuthenticationImage.module.css';

export function AuthenticationImage() {
  const { setToken } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false); // Optional flag for the backend
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        '/api/login', // Production
        new URLSearchParams({ username, password }),
        { withCredentials: true } // Ensure cookies are sent/received
      );

      setToken(response.data.access_token); // Store access token in memory
      setError('');
      navigate('/'); // Redirect to home page after login
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className={classes.wrapper} style={{ height: '100vh' }}>
      <Paper className={classes.form} radius={0} p={30} style={{ height: '100%' }}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Welcome back!
        </Title>

        <TextInput
          label="Username"
          placeholder="Your username"
          size="md"
          value={username}
          onChange={(event) => setUsername(event.currentTarget.value)}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          size="md"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
        />
        <Checkbox
          label="Keep me logged in"
          mt="xl"
          size="md"
          checked={keepLoggedIn}
          onChange={(event) => setKeepLoggedIn(event.currentTarget.checked)}
        />
        {error && (
          <Text c="red" mt="md">
            {error}
          </Text>
        )}
        <Button fullWidth mt="xl" size="md" onClick={handleLogin}>
          Login
        </Button>
      </Paper>
    </div>
  );
}