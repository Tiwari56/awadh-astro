export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        Awadh Astro · Ayodhya, Uttar Pradesh · Guidance is for informational and spiritual
        purposes only and is not a substitute for medical, legal, or financial advice.
      </p>
      <p style={{ marginTop: 6 }}>© {new Date().getFullYear()} Awadh Astro. All rights reserved.</p>
    </footer>
  );
}
