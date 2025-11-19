import axios from 'axios';
// import { getSession, signOut } from 'next-auth/react';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const createAxiosInstance = (config = {}) =>
  axios.create({
    baseURL,
    timeout: 20000,
    ...config,
  });
const dataBaseURL = process.env.NEXT_PUBLIC_API_DATA_BASE_URL;

export const axiosDataPrivate = axios.create({
  baseURL: dataBaseURL,
  timeout: 20000,
});

export const axiosDataPublic = axios.create({
  baseURL: dataBaseURL,
  timeout: 20000,
});
export const axiosPublic = createAxiosInstance();
export const axiosPrivate = createAxiosInstance();

// axiosDataPrivate.interceptors.request.use(
//   async (config) => {
//     const session = await getSession();

//     if (session?.access_token) {
//       config.headers.Authorization = `Bearer ${session.access_token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );
// axiosPrivate.interceptors.request.use(
//   async (config) => {
//     const session = await getSession();

//     if (session?.access_token) {
//       config.headers.Authorization = `Bearer ${session.access_token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// axiosDataPrivate.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Check if it's a 401 error and we haven't already retried
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       console.log('Token expired, triggering NextAuth session refresh...');

//       try {
//         await fetch('/api/auth/session', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             update: true,
//           }),
//         });

//         const updatedSession = await getSession();

//         if (updatedSession?.access_token) {
//           originalRequest.headers.Authorization = `Bearer ${updatedSession.access_token}`;

//           return axiosDataPrivate(originalRequest);
//         }
//       } catch (refreshError) {
//         console.error('❌ Session refresh failed:', refreshError);
//       }

//       await signOut({ redirect: false });
//       if (typeof window !== 'undefined') {
//         window.location.href = '/auth/sign-in?reason=session_expired';
//       }
//       return Promise.reject(error);
//     }
//     return Promise.reject(error);
//   },
// );
// axiosPrivate.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Check if it's a 401 error and we haven't already retried
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       console.log('Token expired, triggering NextAuth session refresh...');

//       try {
//         await fetch('/api/auth/session', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             update: true,
//           }),
//         });

//         const updatedSession = await getSession();

//         if (updatedSession?.access_token) {
//           originalRequest.headers.Authorization = `Bearer ${updatedSession.access_token}`;

//           return axiosDataPrivate(originalRequest);
//         }
//       } catch (refreshError) {
//         console.error('Session refresh failed:', refreshError);
//       }

//       await signOut({ redirect: false });
//       if (typeof window !== 'undefined') {
//         window.location.href = '/auth/sign-in?reason=session_expired';
//       }
//       return Promise.reject(error);
//     }
//     return Promise.reject(error);
//   },
// );
