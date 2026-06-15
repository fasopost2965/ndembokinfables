import 'dotenv/config';
import { createApp } from './app.js';

const app = createApp();

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 crm-api running on http://localhost:${PORT}`);
  });
}

export default app;
