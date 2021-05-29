module.exports = {
  /*
   ** Headers of the page
   */
  head: {
    title: "Vevue",
    meta: [
      {
        charset: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        hid: "description",
        name: "description",
        content:
          "Vevue is a P2P incentivized video network based on the Qtum blockchain. Make videos, earn tokens anywhere in the world."
      }
    ],
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/images/favicon.ico"
      }
    ]
  },
  /*
   ** Customize the progress bar color
   */
  loading: {
    color: "#3B8070"
  },
  plugins: [
    {
      src: "~plugins/ElementUI",
      ssr: true
    }
  ],
  css: [
    "element-ui/lib/theme-chalk/index.css",
    "./src/assets/css/layout.css",
    "./src/assets/css/reset.css",
    "./src/assets/css/gridlayout.css",
    "./src/assets/font/iconfont.css",
    "video.js/dist/video-js.css"
  ],
  /*
   ** Build configuration
   */
  build: {
    vendor: [
      "axios",
      "element-ui",
      "./src/static/tools/jsFormat.js",
      "./src/assets/js/config/urlConfig",
      "./src/static/tools/cookies.js",
      "./src/static/tools/qrcode.min.js"
    ]
  },
  srcDir: "src/",
  performance: {
    gzip: false
  },
  router: {
    middleware: "redirect"
  },
  dev: false
};
