export default interface ItoastProps {
    title: string;
    description: string;
    status: 'info' | 'warning' | 'success' | 'error' | 'loading' | undefined;
}