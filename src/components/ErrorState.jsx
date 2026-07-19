export default function ErrorState({ message = 'Something went wrong. Please try again.' }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            gap: '12px',
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(192,57,43,0.1)',
                border: '1px solid rgba(192,57,43,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
            }}>
                ✕
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '280px', lineHeight: 1.5 }}>
                {message}
            </p>
        </div>
    )
}
