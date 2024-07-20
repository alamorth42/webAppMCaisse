'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import CrossIcon from '@/assets/CrossIcon.svg'

interface ImageModalProps {
  imageUrl: string | undefined
  title: string | undefined
  closeModal: () => void
}

export default function ImageModal({ imageUrl, title, closeModal }: ImageModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => {
      setIsVisible(false);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      closeModal();
    }, 300);
  };

  return (
    <div onClick={handleClose} className={`z-[101] w-screen h-[100dvh] flex justify-center items-center bg-[rgba(0,0,0,0.8)] top-0 fixed ${isVisible ? 'fade-in show' : 'fade-out hide'}`}>
      <div onClick={(e) => e.stopPropagation()} className='flex flex-col justify-center items-center w-[300px]'>
        <div className='relative h-[300px] w-full'>
          <Image unoptimized={true} onClick={handleClose} className='absolute h-[30px] w-[30px] right-2 top-2 cursor-pointer' src={CrossIcon} alt='' width={30} height={30}></Image>
          <Image onClick={(e) => e.stopPropagation()} unoptimized={true} className='h-[300px] w-full object-cover aspect-square rounded-[10px]' src={imageUrl ? imageUrl : ''} alt='' width={300} height={300}></Image>
        </div>
        <h2 onClick={(e) => e.stopPropagation()} className='text-16 font-semibold text-white h-[50px] flex items-center justify-center'>{title}</h2>
      </div>
    </div>
  )
}
