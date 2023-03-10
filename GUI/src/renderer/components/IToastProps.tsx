export default interface IToastProps {
    title: string;
    description: string;
    status: 'info' | 'warning' | 'success' | 'error' | 'loading' | undefined;
}