'use client'
import Image from 'next/image';
import { useState } from 'react';

import AddIconSquare from '@/assets/AddIconSquare.svg';
import DeleteIcon from '@/assets/DeleteIcon.svg';
import RemoveIcon from '@/assets/RemoveIcon.svg';
import { v4 as uuidv4 } from 'uuid';

export default function OrderItem({ menuItem, calculateTotalPrice, addMenuItem, openImageModalHander, deleteMenuItem, deleteMenu }: any) {

  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false); // State to trigger animation

  const toggleTextVisibility = () => {
    setIsTextVisible(!isTextVisible);
  };

  const handleRemove = (menuItemMenuId: any, menuItemId: any, menuItem: any) => {
    setIsRemoving(true);
    setTimeout(() => {
      setIsRemoving(false);
      deleteMenuItem(menuItemMenuId, menuItemId, menuItem);
    }, 500);
  };

  return (
    <div className={`py-[10px] flex justify-between ${isRemoving ? 'slide-out' : ''} overflow-hidden min-h-[80px]`} key={menuItem.id} style={{ transition: 'width 0.5s' }}>
      <div className='flex flex-col justify-between'>
        <div className='flex-1'>
          <h2 className='w-[170px] text-12 font-bold text-primaryText-light'>{menuItem?.menu?.titre}</h2>
          <div>
            {menuItem?.options?.length === 0 || (menuItem?.options?.length === 1 && menuItem?.menu?.options.find((op: any) => op.id === menuItem?.options[0].idOptionGroup).isSelectedByDefault) ? null : <div className='flex items-center' onClick={toggleTextVisibility}>
              <span className='w-[50px] text-8 font-semibold text-secondaryText-light'>Voir plus</span>
              <svg className={`${isTextVisible ? 'rotate-180' : 'rotate-0'} transition-all`} width="6" height="4" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3 2.68316L5.19137 0.15976C5.37636 -0.0532533 5.67628 -0.0532533 5.86126 0.15976C6.04625 0.372773 6.04625 0.718136 5.86126 0.931149L3.33495 3.84024C3.14996 4.05325 2.85004 4.05325 2.66505 3.84024L0.138739 0.931149C-0.0462465 0.718136 -0.0462465 0.372773 0.138739 0.15976C0.323724 -0.0532533 0.623643 -0.0532533 0.808629 0.15976L3 2.68316Z" fill="#101433" />
              </svg>
            </div>}
            <div className={`overflow-hidden transition-all duration-300 ${isTextVisible ? 'max-h-[500px]' : 'max-h-0'}`}>
              {menuItem?.options?.map((option: any, index: number, arr: any) => {
                //console.log('option', option);
                const foundOptions = menuItem?.menu?.options.find((op: any) => op.id === option?.idOptionGroup);
                if (foundOptions?.isSelectedByDefault) {
                  return null;
                }
                return (
                  <div key={option?.titre} className={`flex justify-between items-center w-[170px] ${index === arr?.length - 1 ? '' : 'border-b border-[#303C994D]'}`}>
                    <p className={` text-wrap text-8 font-semibold text-[#303C99] h-[20px] flex items-center `}>{option?.titre}</p>
                    <p className='text-8 font-bold text-[#303C99]'>{option?.price ? `+ ${(option?.price / 100)?.toFixed(2)}€` : ''}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <p className='text-12 font-bold text-primaryText-light'>{`${calculateTotalPrice(menuItem).toFixed(2)} €`}</p>
      </div>
      <div className='flex items-center gap-[10px]'>
        <div className='flex flex-col items-center gap-[10px]'>
          <Image onClick={() => {
            if (menuItem?.number === 1) {
              //console.log('running 1111111');
              handleRemove(menuItem?.menu?.id, menuItem?.id, true);
            } else {
              deleteMenuItem(menuItem?.menu?.id, menuItem?.id, true)
            }
          }} unoptimized={true} src={RemoveIcon} alt='' width={20} height={20} className='w-[20px] h-[20px] object-cover aspect-square cursor-pointer' />
          <p className='flex justify-center items-center w-[20px] h-[20px] bg-primaryText-light text-white text-10 rounded-[5px]'>{menuItem?.number}</p>
          <Image
            onClick={() => {
              const data = {
                menu: menuItem?.menu,
                options: null,
                number: 1,
                id: uuidv4(),
                isSend: false as false,
              };

              addMenuItem(data, false, menuItem.id);
            }}
            unoptimized={true} src={AddIconSquare} alt='' width={20} height={20} className='w-[20px] h-[20px] object-cover aspect-square cursor-pointer' />
        </div>
        <div className='flex items-center gap-[20px]'>
          {menuItem?.menu?.urls?.length > 0 && menuItem?.menu?.urls[0].url ? <Image onClick={() => openImageModalHander(menuItem?.menu?.urls[0].url, menuItem?.menu?.titre)} unoptimized={true} src={menuItem?.menu?.urls[0].url} alt='' width={80} height={80} className='rounded-[5px] w-[80px] h-[80px] object-cover aspect-square' /> : null}
          <Image onClick={() => {
            //console.log('running 2222222');
            handleRemove(menuItem?.menu?.id, menuItem?.id, menuItem)
          }} unoptimized={true} src={DeleteIcon} alt='' width={18} height={20} className='w-[18px] h-[20px] object-cover aspect-square cursor-pointer' />
        </div>
      </div>
    </div >
  )
}
