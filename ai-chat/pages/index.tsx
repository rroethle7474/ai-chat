import Layout from './shared/layout';
import { useEffect } from 'hono/jsx';

export default function IndexPage() {
  // Redirect to the chat page when the component is rendered
  useEffect(() => {
    window.location.href = '/chat';
  }, []);

  return (
    <Layout>
      <div>Redirecting to chat...</div>
    </Layout>
  );
}