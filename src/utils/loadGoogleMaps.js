export const loadGoogleMapsScript = () => {
  if (window.google || document.getElementById('google-maps')) return;

  const script = document.createElement('script');
  script.id = 'google-maps';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
};
