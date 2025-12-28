import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        className: 'toast-notification',
        style: {},
        // Success
        success: {
          duration: 3000,
          className: 'toast-success',
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        // Error
        error: {
          duration: 5000,
          className: 'toast-error',
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
        // Loading
        loading: {
          className: 'toast-loading',
          iconTheme: {
            primary: '#8b5cf6',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
