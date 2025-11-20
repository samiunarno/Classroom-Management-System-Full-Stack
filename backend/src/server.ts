/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import app from './app.js';
import mongoose from 'mongoose';
import chalk from 'chalk';
import { Express, RequestHandler } from 'express';

const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/assignmentdb';
const BASE_URL = `http://localhost:${PORT}`;

// Helper function to list all routes with full localhost URL
function showAllRoutes(app: Express) {
  console.log(chalk.cyan.bold('\n📚 Available API Routes:\n'));

  const routes: Array<{ path: string; methods: string }> = [];

  app._router?.stack?.forEach((middleware: any) => {
    // Direct route
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods)
        .map(m => m.toUpperCase())
        .join(', ');
      routes.push({ path: middleware.route.path, methods });
    }

    // Nested router (router.use())
    else if (middleware.name === 'router' && middleware.handle?.stack) {
      middleware.handle.stack.forEach((handler: any) => {
        const route = handler.route;
        if (route) {
          const methods = Object.keys(route.methods)
            .map(m => m.toUpperCase())
            .join(', ');

          const basePath = middleware.regexp?.source
            .replace('^\\', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/')
            .replace(/\$$/, '');

          routes.push({
            path: `${basePath}${route.path}`,
            methods,
          });
        }
      });
    }
  });

  // Display all collected routes
  routes.forEach(r => {
    console.log(
      chalk.green(
        `➡️  [${r.methods}] ${BASE_URL}${
          r.path.startsWith('/') ? r.path : '/' + r.path
        }`,
      ),
    );
  });

  console.log(chalk.gray('\n✅ Total Routes:'), chalk.yellow(routes.length));
  console.log(
    chalk.magenta('------------------------------------------------------\n'),
  );
}

// MongoDB + Server connect
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(chalk.greenBright('✅ MongoDB connected successfully'));
    app.listen(PORT, () => {
      console.log(chalk.blueBright(`🚀 Server running on port ${PORT}`));
      console.log(
        chalk.yellow(
          `🌐 Environment: ${process.env.NODE_ENV || 'development'}`,
        ),
      );
      showAllRoutes(app);
    });
  })
  .catch(err => {
    console.error(chalk.red('❌ MongoDB connection error:'), err);
  });




// /* eslint-disable @typescript-eslint/no-explicit-any */
// import app from './app.js';
// import mongoose from 'mongoose';
// import chalk from 'chalk';

// const PORT = process.env.PORT || 4000;
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/assignmentdb';
// const BASE_URL = `http://localhost:${PORT}`;

// // Helper function to list all routes with full localhost URL
// function showAllRoutes(app: any) {
//   console.log(chalk.cyan.bold('\n📚 Available API Routes:\n'));

//   const routes: any[] = [];


//   app._router.stack.forEach(middleware => {
//     if (middleware.route) {
//       // Direct route
//       const methods = Object.keys(middleware.route.methods)
//         .map(m => m.toUpperCase())
//         .join(', ');
//       routes.push({ path: middleware.route.path, methods });
//     } else if (middleware.name === 'router' && middleware.handle.stack) {
//       // Nested router (like app.use('/api/auth', authRoutes))
//       middleware.handle.stack.forEach(handler => {
//         const route = handler.route;
//         if (route) {
//           const methods = Object.keys(route.methods)
//             .map(m => m.toUpperCase())
//             .join(', ');
//           const basePath = middleware.regexp.source
//             .replace('^\\', '')
//             .replace('\\/?(?=\\/|$)', '')
//             .replace(/\\\//g, '/')
//             .replace(/\$$/, '');
//           routes.push({ path: `${basePath}${route.path}`, methods });
//         }
//       });
//     }
//   });

//   // Display all collected routes
//   routes.forEach(r => {
//     console.log(
//       chalk.green(`➡️  [${r.methods}] ${BASE_URL}${r.path.startsWith('/') ? r.path : '/' + r.path}`)
//     );
//   });

//   console.log(chalk.gray('\n✅ Total Routes:'), chalk.yellow(routes.length));
//   console.log(chalk.magenta('------------------------------------------------------\n'));
// }

// // MongoDB + Server connect
// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log(chalk.greenBright('✅ MongoDB connected successfully'));
//     app.listen(PORT, () => {
//       console.log(chalk.blueBright(`🚀 Server running on port ${PORT}`));
//       console.log(chalk.yellow(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`));
//       showAllRoutes(app);
//     });
//   })
//   .catch(err => {
//     console.error(chalk.red('❌ MongoDB connection error:'), err);
//   });
