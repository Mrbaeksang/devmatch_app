import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t py-4">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} DevMatch. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
