'use client';
import React, { useState, useEffect } from 'react';
import CrossIconDark from '@/assets/CrossIconDark.svg';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import useOrderStore from '@/store/order';
import ImageModal from './ImageModal';

interface ImageModalProps {
  menuItem: any | undefined;
  closeModal: () => void;
}

interface OptionChoose {
  titre: string;
  price: number | null;
  required: boolean;
  number: number;
  idOptionGroup: string;
  titreGroup: string;
}

export default function MenuModal({ menuItem, closeModal }: ImageModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<OptionChoose[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(menuItem?.price || 0);
  const [allRequiredSelected, setAllRequiredSelected] = useState<boolean>(true);
  const { data: orderData, addMenuItem } = useOrderStore();

  useEffect(() => {
    if (menuItem?.options) {
      const initialSelectedOptions: OptionChoose[] = [];
      menuItem.options.forEach((option: any) => {
        for (let i = 1; i <= 20; i++) {
          const optionKey = `option${i}`;
          if (option.isSelectedByDefault && option[optionKey]) {
            initialSelectedOptions.push({
              titre: option[optionKey],
              price: option[`price_${optionKey}`],
              required: option.isRequired,
              number: initialSelectedOptions.length + 1,
              idOptionGroup: option.id,
              titreGroup: option.titre,
            });
            if (option[`price_${optionKey}`]) {
              setTotalPrice(prevTotal => prevTotal + option[`price_${optionKey}`]);
            }
            break;
          }
        }
      });
      setSelectedOptions(initialSelectedOptions);
    }
  }, [menuItem]);

  useEffect(() => {
    if (menuItem?.options) {
      const requiredOptions = menuItem.options.filter((option: any) => option.isRequired);
      const allRequiredSelected = requiredOptions.every((option: any) =>
        selectedOptions.some(opt => opt.idOptionGroup === option.id)
      );
      setAllRequiredSelected(allRequiredSelected);
    }
  }, [selectedOptions, menuItem]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      closeModal();
    }, 300);
  };

  const handleAddToCart = () => {
    const requiredOptions = menuItem?.options?.filter((option: any) => option.isRequired);

    if (requiredOptions && requiredOptions.length > 0) {
      const missingRequired = requiredOptions.some((option: any) =>
        selectedOptions.filter(opt => opt.idOptionGroup === option.id).length === 0
      );

      if (missingRequired) {
        alert('Veuillez sélectionner toutes les options obligatoires.');
        return;
      }
    }

    const exceedingMaxChoice = menuItem?.options?.some((option: any) => {
      const selectedCount = selectedOptions.filter(opt => opt.idOptionGroup === option.id).length;
      return selectedCount > option.maxChoice;
    });

    if (exceedingMaxChoice) {
      alert('Vous avez dépassé le nombre maximum d\'options autorisées pour une des sélections.');
      return;
    }

    const data = {
      menu: menuItem,
      options: selectedOptions,
      number: 1,
      id: uuidv4(),
      isSend: false as false,
    };

    addMenuItem(data, true);
    closeModal();
  };
  const handleOptionChange = (optionGroup: any, optionKey: string, checked: boolean) => {
    setSelectedOptions(prevSelectedOptions => {
      const existingSelections = prevSelectedOptions.filter(opt => opt.idOptionGroup === optionGroup.id);
      const isSelected = existingSelections.some(opt => opt.titre === optionGroup[optionKey]);
      const currentSelectedCount = existingSelections.length;

      if (checked) {
        if (currentSelectedCount >= optionGroup.maxChoice) {
          const lastOption = existingSelections[existingSelections.length - 1];
          const newSelectedOptions = prevSelectedOptions.filter(opt => !(opt.idOptionGroup === lastOption.idOptionGroup && opt.titre === lastOption.titre));
          const newOption: OptionChoose = {
            titre: optionGroup[optionKey],
            price: optionGroup[`price_${optionKey}`],
            required: optionGroup.isRequired,
            number: 1,
            idOptionGroup: optionGroup.id,
            titreGroup: optionGroup.titre,
          };

          if (lastOption?.price) {
            setTotalPrice(prevTotal => prevTotal - ((lastOption.price || 0) / 100));
          }
          if (newOption.price) {
            setTotalPrice(prevTotal => prevTotal + ((newOption.price || 0) / 100));
          }

          return [...newSelectedOptions, newOption];
        } else {
          const newOption: OptionChoose = {
            titre: optionGroup[optionKey],
            price: optionGroup[`price_${optionKey}`],
            required: optionGroup.isRequired,
            number: 1,
            idOptionGroup: optionGroup.id,
            titreGroup: optionGroup.titre,
          };
          //console.log('price', newOption.price);

          if (newOption.price) {
            setTotalPrice(prevTotal => prevTotal + ((newOption.price || 0) / 100));
          }
          return [...prevSelectedOptions, newOption];
        }
      } else if (!checked && isSelected) {
        const newSelectedOptions = prevSelectedOptions.filter(opt => !(opt.idOptionGroup === optionGroup.id && opt.titre === optionGroup[optionKey]));
        const removedOption = prevSelectedOptions.find(opt => opt.idOptionGroup === optionGroup.id && opt.titre === optionGroup[optionKey]);

        if (removedOption?.price) {
          setTotalPrice(prevTotal => prevTotal - ((removedOption.price || 0) / 100));
        }
        return newSelectedOptions;
      }

      return prevSelectedOptions;
    });
  };
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [modalImg, setModalImg] = useState<string>();
  const [modalTitle, setModalTitle] = useState<string>();

  const openImageModalHander = (image: string, title: string): void => {
    setModalImg(image);
    setModalTitle(title);
    setOpenModal(true);
  }

  const cloaseModalHander = (): void => {
    setOpenModal(false);
  }

  return (
    <>
      {
        openModal ?
          <ImageModal imageUrl={modalImg} title={modalTitle} closeModal={cloaseModalHander} /> : null
      }
      <div className={`z-[100] w-screen h-[100dvh] flex flex-col bg-[rgba(255,255,255,1)] top-0 fixed px-[20px] overflow-auto ${isVisible ? 'menu-modal-enter' : 'menu-modal-exit'}`}>
        <Image unoptimized={true} onClick={handleClose} className='absolute h-[30px] w-[30px] left-[20px] top-[60px]' src={CrossIconDark} alt='' width={30} height={30} />
        <div className='pt-[60px] w-full flex flex-col items-center'>
          {menuItem?.urls?.length > 0 && menuItem?.urls[0]?.url ?
            <Image
              onClick={(e) => { openImageModalHander(menuItem?.urls?.length > 0 && menuItem?.urls[0]?.url, menuItem?.titre); e.stopPropagation() }}
              unoptimized={true} className='h-[160px] w-[160px] object-cover aspect-square rounded-[10px]' src={menuItem?.urls[0]?.url || ''} alt='' width={160} height={160} /> :
            <div className='h-[160px] w-[160px]'></div>}
          <div className='mt-[20px] mb-[15px]'>
            <h2 className='w-full text-20 font-bold text-primaryText-light text-center'>{menuItem?.titre}</h2>
            <p className='w-full text-10 font-semibold text-secondaryText-light'>{menuItem?.description}</p>
          </div>
        </div>
        <div className='h-[calc(100dvh-385px)] overflow-auto'>
          {menuItem?.options?.map((option: any) => {
            if (option?.isSelectedByDefault) {
              return null
            }
            return (
              <div key={option.id} className=''>
                <div className='flex justify-between items-center mt-[15px] '>
                  <p className='text-16 font-bold text[#101433]'>{`${option?.titre} :`}</p>
                  {option?.isRequired ? <p className='text-8 font-bold text-white bg-[#AB1515] rounded-[10px] w-[80px] h-[20px] flex justify-center items-center'>Obligatoire</p> : null}
                </div>
                <div className='flex justify-between items-center mt-[4px] mb-[18px]'>
                  <p className='text-8 font-bold' style={{ color: 'rgba(16, 20, 51, 0.7)' }}>{`Maximum: ${option?.maxChoice}`}</p>
                </div>
                <div className='flex flex-col'>
                  {Array.from({ length: 20 }, (_, index) => index + 1).map(num => {
                    const optionKey = `option${num}`;
                    const optionPriceKey = `price_option${num}`;
                    if (option[optionKey]) {
                      //console.log('optionPriceKey', option[optionPriceKey])
                      return (
                        <label key={optionKey} className="inline-flex items-center justify-between pt-2 pb-2 border-b border-[#303C994D] checkbox-container">
                          <span className="ml-2 font-14 font-semibold text-[#303C99]">{option[optionKey]}</span>
                          <div className='w-[70px] items-center flex justify-between'>
                            <p className='text-10 font-bold text-[#303C99]'>{option[optionPriceKey] ? `+ ${(option[optionPriceKey] / 100)?.toFixed(2)}€` : ''}</p>
                            <>
                              <input
                                type="checkbox"
                                checked={selectedOptions.some(opt => opt.idOptionGroup === option.id && opt.titre === option[optionKey])}
                                onChange={(e) => handleOptionChange(option, optionKey, e.target.checked)}
                                className="hidden-checkbox"
                              />
                              <span className={`custom-checkbox ${selectedOptions.some(opt => opt.idOptionGroup === option.id && opt.titre === option[optionKey]) ? 'checked' : ''}`}></span>
                            </>
                          </div>
                        </label>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div className={`m-auto mt-[30px] mb-[30px] w-[250px] min-h-[40px] rounded-[10px] bg-button-gradient text-white flex justify-center items-center gap-2 ${allRequiredSelected ? '' : 'opacity-70 cursor-not-allowed'}`}>
          <p
            onClick={allRequiredSelected ? handleAddToCart : undefined}
            className={`text-12 ${allRequiredSelected ? '' : 'opacity-70 cursor-not-allowed'}`}
          >
            {`Ajouter au panier - ${totalPrice.toFixed(2)} €`}
          </p>
        </div>
      </div>
    </>
  );
}
