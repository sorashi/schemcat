import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:4000',
    videoUploadOnPasses: false,
  },
})
