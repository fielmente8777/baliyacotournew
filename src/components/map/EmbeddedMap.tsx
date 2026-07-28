// components/EmbeddedMap.jsx
import React from "react";

const EmbeddedMap: React.FC<{ src: string }> = ({ src }) => {
  return (
    <iframe
      src={`${src ? src : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d448196.52633258584!2d76.76357436215976!3d28.643684626335453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x37205b715389640!2sDelhi!5e0!3m2!1sen!2sin!4v1724142748491!5m2!1sen!2sin"}`}
      className="w-full h-full overflow-hidden"
      allowFullScreen={true}
      loading="lazy"
      title="Embedded Map"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
};

export default EmbeddedMap;
