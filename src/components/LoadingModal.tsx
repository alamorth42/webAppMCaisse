'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import SuccessIcon from '@/assets/SuccessIcon.svg'
import LoaderWhite from '@/assets/LoaderWhite.svg'
import LoaderSuccess from './LoaderSuccess'

interface ImageModalProps {
  loading: boolean | undefined
  closeModal: () => void
}

export default function LoadingModal({ loading, closeModal }: ImageModalProps) {
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
    <div onClick={handleClose} className={`z-[103] w-screen h-[100dvh] flex justify-center items-center bg-[rgba(0,0,0,0.8)] top-0 fixed ${isVisible ? 'fade-in show' : 'fade-out hide'}`}>
      <div className='flex flex-col justify-center items-center w-[300px]'>
        <div className='relative h-[300px] w-full flex justify-center items-center'>
          {loading ?
            // <Image unoptimized={true} onClick={handleClose} className='h-[160px] w-[160px] cursor-pointer' src={LoaderWhite} alt='' width={160} height={160}></Image>
            <LoaderSuccess />
            :
            <div className='flex flex-col items-center justify-center gap-[20px]'>
              <Image unoptimized={true} className='h-[160px] w-[160px] object-cover aspect-square rounded-[10px]' src={SuccessIcon} alt='' width={160} height={160}></Image>
              <p className='text-16 text-white'>Commande en cours de préparation</p>
            </div>
          }
        </div>
      </div>
    </div>
  )
}
