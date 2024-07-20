'use client'
import React, { useEffect } from 'react'
import TableIcon from '../assets/tableIcon.svg'
import Image from 'next/image'
import useOrderStore from '@/store/order';
import { useParams } from 'next/navigation'
import useTableStore from '@/store/table';

export default function Orderinformation() {
  const params = useParams();
  const { totalPrice, } = useOrderStore();
  const { data, fetchData } = useTableStore();

  useEffect(() => {
    if (fetchData && params?.slug?.length === 3 && params?.slug[0]) {
      fetchData(params.slug[0], params?.slug[1], params?.slug[2])
    }
  }, [fetchData, params.slug])

  return (
    <div className='p-[10px] flex justify-between items-center'>
      <div className='w-[125px] h-[30px] rounded-[10px] bg-button-gradient text-white flex justify-center items-center gap-2'>
        <p className='text-12'>{`Total:`}</p>
        <p className='text-12'>{`${totalPrice.toFixed(2)} €`}</p>
      </div>
      {params?.userID ? null : <div className='relative'>
        <Image unoptimized={true} src={TableIcon} alt='Table number icon'></Image>
        <p className='absolute top-[-4px] right-[-1px] border border-white text-6 text-white bg-button-gradient rounded-full w-[12px] h-[12px] flex justify-center items-center'>{data?.name}</p>
      </div>}
    </div>
  )
}
