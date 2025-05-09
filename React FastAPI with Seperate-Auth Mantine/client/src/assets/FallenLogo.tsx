interface FallenLogoProps {
    size?: number;
}

export default function FallenLogo({ size = 150 }: FallenLogoProps) {
    const sizeString = `${size}px`;
    return (
        <img
        src="/assets/ft-logo.png"
        alt="Fallen Logo"
        style={{
            width: 'auto',
            height: sizeString,
        }}
        />
    );
}
  