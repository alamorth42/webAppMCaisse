import React, { useState, useEffect } from 'react';
import CrossIconDark from '@/assets/CrossIconDark.svg';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import useOrderStore from '@/store/order';

import BackIcon from '@/assets/BackIcon.svg';
import DeleteIcon from '@/assets/DeleteIcon.svg';
import AddIcon from '@/assets/AddIcon.svg';
import RemoveIcon from '@/assets/RemoveIcon.svg';
import axios from 'axios';
import useUserStore from '@/store/user';
import LoadingModal from './LoadingModal';
import TimePicker from './Timepicker';

interface UserInfoModalProps {
  data: any;
  closeModal: () => void;
  closerOrderModal: () => void;
}

export default function UserInfoModal({ data: propsData, closeModal, closerOrderModal }: UserInfoModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { data: orderData, clearOrderData, totalPrice, setError: setOrderError } = useOrderStore();

  const params = useParams();

  const [nameClient, setNameClient] = useState('');
  const [telClient, setTelClient] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [loading, setLoading] = useState(false);
  const { data: userData } = useUserStore();

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

  const handleOrder = () => {
    setLoading(true);
    setOpenSuccessModal(true);

    const dateClickAndCollect = new Date();
    dateClickAndCollect.setHours(+selectedTime.split(':')[0]);
    dateClickAndCollect.setMinutes(+selectedTime.split(':')[1]); // Corrected to minutes
    dateClickAndCollect.setSeconds(0);

    const orderData = {
      ...propsData,
      type: 2, // 2 for surPlace and 2 for clickAndCollect 
      date: new Date().getTime(),
      nameClient,
      telClient,
      dateClickAndCollect: dateClickAndCollect.getTime(),
    };

    const userId = params?.userID;

    axios.post('https://europe-west1-miamapp-cc1ca.cloudfunctions.net/sendCommandeToCaisse', { commande: orderData }, {
      params: {
        userID: userId,
        serviceID: userData?.servicesEnCours?.idService
      },
      headers: {
        'api-key': 'voldiTest'
      }
    }).then(response => {
      setLoading(false);
    }).catch(error => {
      setOrderError && setOrderError(error);
      cloaseSuccessModalHander();
    });
  };

  const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);

  const openSuccessModalHander = (): void => {
    setOpenSuccessModal(true);
  }

  const cloaseSuccessModalHander = (): void => {
    clearOrderData();
    setOpenSuccessModal(false);
    closerOrderModal();
    closeModal();
  }

  const isDateInPast = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const dateSelected = new Date();
    dateSelected.setHours(hours);
    dateSelected.setMinutes(minutes);
    dateSelected.setSeconds(0);
    //console.log('dateSelected', dateSelected < now)
    return dateSelected < now;
  };

  const calculateTotalPrice = (data: any): number => {
    const menuPrice = data.menu.price;

    const optionsPrice = data.options?.reduce((optionTotal: number, option: any) => {
      if (option.price) {
        return optionTotal + ((option.price || 0) / 100);
      }
      return optionTotal;
    }, 0) || 0;

    const itemTotal = (menuPrice + optionsPrice) * data.number;

    return itemTotal;
  };

  const isValidPhoneNumber = (phone: string) => {
    return phone.length >= 10;
  };

  const isButtonDisabled = !nameClient || !telClient || !isValidPhoneNumber(telClient) || (selectedTime && isDateInPast(selectedTime));

  return (
    <>
      {openSuccessModal ? <LoadingModal loading={loading} closeModal={cloaseSuccessModalHander} /> : null}
      <div className={`z-[102] w-screen h-[100dvh] flex flex-col justify-between bg-[rgba(255,255,255,1)] top-0 fixed overflow-auto ${isVisible ? 'modal-enter' : 'modal-exit'}`}>
        <div className='w-full flex flex-col items-center pt-[30px] relative'>
          <div onClick={handleClose} className='absolute left-[20px] top-[37px]'>
            <Image unoptimized={true} src={BackIcon} alt='' width={20} height={20} />
          </div>
          <div className='w-[250px] h-[30px] rounded-[10px] bg-button-gradient text-white flex justify-center items-center gap-2 relative'>
            <p className='text-12'>{`Informations personnelles`}</p>
          </div>
          <div className='w-full mt-[30px] p-[20px] flex flex-col gap-[30px] h-[calc(100dvh-215px)] max-h-[calc(100dvh-215px)] overflow-auto'>
            <div className='flex items-center justify-between'>
              <p className='text-14 font-bold text-primaryText-light'>Nom de la commande :</p>
              <input
                type="text"
                className="bg-input-gradient outline-none w-[130px] h-[30px] border border-[#303C9933] rounded-[10px] text-primaryText-light font-semibold text-13 text-center px-2"
                value={nameClient}
                onChange={(e) => setNameClient(e.target.value)}
                placeholder="Nom"
              />
            </div>
            <div className='flex items-center justify-between'>
              <p className='text-14 font-bold text-primaryText-light'>Heure de récupération :</p>
              <TimePicker selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
            </div>
            <div className='flex items-center justify-between'>
              <p className='text-14 font-bold text-primaryText-light'>Numéro de téléphone :</p>
              <input
                type="number"
                pattern="[0-9]*"
                className="bg-input-gradient outline-none w-[130px] h-[30px] border border-[#303C9933] rounded-[10px] text-primaryText-light font-semibold text-13 text-center px-2"
                value={telClient}
                onChange={(e) => setTelClient(e.target.value)}
                placeholder="Numéro"
              />
            </div>
            <div className='flex flex-col w-full'>
              <p className='text-14 font-bold text-primaryText-light underline'>Résumé de commande :</p>
              <div className='w-full mt-[10px]'>
                {orderData?.map((menuItem) => (
                  <div className='w-full py-[10px] flex justify-between items-center' key={menuItem.id}>
                    <h2 className='text-12 font-bold text-primaryText-light'>{`x${menuItem?.number} ${menuItem?.menu?.titre}`}</h2>
                    <p className='text-12 font-bold text-primaryText-light'>{`${calculateTotalPrice(menuItem).toFixed(2)} €`}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='w-full flex flex-col items-center px-[20px] justify-center'>
            <div className='flex justify-between w-full'>
              <p className='text-14 font-bold text-primaryText-light underline'>Total :</p>
              <p className='text-14 font-bold text-primaryText-light underline'>{`${totalPrice.toFixed(2)} €`}</p>
            </div>
            <button
              className={`m-autp my-[30px] w-[250px] h-[40px] rounded-[10px] bg-button-gradient text-white flex justify-center items-center gap-2 ${isButtonDisabled ? 'opacity-70' : ''}`}
              onClick={handleOrder}
              disabled={isButtonDisabled as boolean}
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
