
export const GoogleAnalytics = () => {
  if (import.meta.env.PUBLIC_GOOGLE_ANALYTICS_TAG_ID) {
    return (
      <>
        <script
          async
          src= `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.PUBLIC_GOOGLE_ANALYTICS_TAG_ID}`
      > </script >
      <script>
    // @ts-ignore
        window.dataLayer = window.dataLayer || [];

        function gtag() {
          // @ts-ignore
          dataLayer.push(arguments);
    }
        // @ts-ignore
        gtag('js', new Date());
        // @ts-ignore
        gtag('config', `${import.meta.env.PUBLIC_GOOGLE_ANALYTICS_TAG_ID}`);
      </script>

    )
  }
}