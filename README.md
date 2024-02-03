# Svelte STEP Bro

Svelte STEP Bro is a SvelteKit application designed to render STEP (Standard for the Exchange of Product model data) files directly in the browser. Built using SvelteKit and integrating Three.js along with occt-import-js, it offers a seamless solution for engineers, machinists, and professionals who frequently work with CAD files. Recognizing the high costs associated with CAD software licenses, Svelte STEP Bro is developed as a free alternative, facilitating easy viewing and sharing of 3D models. This project also serves as a deep dive into web-based 3D programming, leveraging modern web technologies to bring complex 3D CAD data to the web platform.

## Getting Started

View the deployed <a href="https://stepbro.vercel.app/">DEMO here.</a> To get Svelte STEP Bro running on your local environment, follow these instructions.

### Prerequisites

Before you begin, ensure you have the Node.js version 18 or later. As of this writing, v21.5.0 is NOT supported for the Vercel adapter, so if using the Vercel adapter, please be sure your Node.js version is compatible to prevent build errors.

### Installing

To set up your development environment, follow these steps:

1. Clone the repository to your local machine:

```
git clone https://github.com/yourusername/svelte-step-bro.git
cd svelte-step-bro
```

2. Install the dependencies:

```
pnpm i
```

3. Run the development server:

```
pnpm dev
```

4. Navigate to `http://localhost:5173` in your browser to see the application running.

## Deployment

To deploy this on a live system, you can use Vercel, Netlify, or any other static site hosting service that supports SvelteKit. The app should be able to run wherever JavaScript can run; please refer to the <a href="https://kit.svelte.dev/docs/adapters">SvelteKit docs for adapters and other deployment information.</a>

## Built With

- [occt-import-js](https://github.com/kovacsv/occt-import-js) - Convert STEP to JSON format that three.js can use.
- [three.js](https://threejs.org/) - Library for 3D graphics in the web browser.
- [Svelte](https://svelte.dev/)
- [SvelteKit](https://kit.svelte.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)

## Lessons Learned:

- Better understanding of using external libraries such as three.js within a Svelte environment
- Better understanding of converting STEP files and rendering 3D graphics in the browser.

## Optimizations:

- Add more features to the 3D model viewer; it is very barebones right now.
- Add instructions on how to use to current and future features
- Add other file formats

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
