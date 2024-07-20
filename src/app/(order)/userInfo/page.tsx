'use client'
import React, { useState } from 'react'
import BackIcon from '@/assets/BackIcon.svg';
import DeleteIcon from '@/assets/DeleteIcon.svg';
import AddIcon from '@/assets/AddIcon.svg';
import RemoveIcon from '@/assets/RemoveIcon.svg';
import Image from 'next/image';
import useOrderStore from '@/store/order';
import TimePicker from '@/components/Timepicker';

export default function Page() {

  const { data } = useOrderStore();
  const [value, setValue] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <div className='w-full flex flex-col items-center pt-[66px] relative'>
      <div className='absolute left-[20px] top-[71px]'>
        {/* <Image src={BackIcon} alt='' width={20} height={20} /> */}
        <img src={BackIcon} alt='' width={20} height={20} className='w-[20px] h-[20px] object-cover aspect-square' />
      </div>
      <div className='w-[250px] h-[30px] rounded-[10px] bg-button-gradient text-white flex justify-center items-center gap-2 relative'>
        <p className='text-12'>{`Résumer de votre commande`}</p>
      </div>
      <div className='w-full mt-[30px] p-[20px] flex flex-col gap-[30px]'>
        <div className='flex items-center justify-between'>
          <p className='text-14 font-bold text-primaryText-light'>Nom de la commande :</p>
          <input
            type="text"
            className="outline-none w-[130px] h-[30px] border custom-border rounded-[10px] text-primaryText-light font-semibold text-13 text-center px-2"
            value={value}
            onChange={handleChange}
            placeholder="Enter text..."
          />
        </div>
        <div className='flex items-center justify-between'>
          <p className='text-14 font-bold text-primaryText-light'>Heure de récupération :</p>
          <TimePicker />
        </div>
        <div className='flex items-center justify-between'>
          <p className='text-14 font-bold text-primaryText-light'>Numéro de téléphone :</p>
          <input
            type="text"
            className="outline-none w-[130px] h-[30px] border custom-border rounded-[10px] text-primaryText-light font-semibold text-13 text-center px-2"
            value={value}
            onChange={handleChange}
            placeholder="Enter text..."
          />
        </div>
        <div className='flex flex-col w-full'>
          <p className='text-14 font-bold text-primaryText-light underline'>Résumé de commande :</p>
          <div className='w-full mt-[10px]'>
            {data?.map((menuItem) => {
              return (
                <div className='w-full py-[10px] flex justify-between items-center' key={menuItem.id}>
                  <h2 className=' text-12 font-bold text-primaryText-light'>{`x${menuItem?.number} ${menuItem?.menu?.titre}`}</h2>
                  <p className='text-12 font-bold text-primaryText-light'>{`${menuItem?.menu?.price} €`}</p>
                </div>)
            })}
          </div>
        </div>
        <div className='flex justify-between w-full mt-[50px]'>
          <p className='text-14 font-bold text-primaryText-light underline'>Total :</p>
          <p className='text-14 font-bold text-primaryText-light underline'>{`0.00 €`}</p>
        </div>
        <button className='m-auto w-[250px] h-[40px] rounded-[10px] bg-button-gradient text-white flex justify-center items-center gap-2'>
          Confirmer
        </button>
      </div>
    </div>
  )
}