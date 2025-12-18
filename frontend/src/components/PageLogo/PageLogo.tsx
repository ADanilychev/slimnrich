import React from 'react'
import Image from 'next/image';

const PageLogo = () => {
  return (
    <div className="page__logo">
        <Image src={'/img/logo.svg'} width={115} priority quality={50} height={40} alt="logo" />
    </div>
  )
}

export default PageLogo