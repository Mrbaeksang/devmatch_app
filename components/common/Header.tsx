import React from 'react';

const Header = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <p className="font-bold">AI 팀 빌딩 매니저</p>
        <nav>
          <p>메뉴</p>
        </nav>
      </div>
    </header>
  );
};

export default Header;
