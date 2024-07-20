'use client'
import useOrderStore from '@/store/order';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import BackIcon from '@/assets/BackIcon.svg';
import useTableStore from '@/store/table';
import useUserStore from '@/store/user';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ImageModal from './ImageModal';
import LoadingModal from './LoadingModal';
import OrderItem from './OrderItem';
import UserInfoModal from './UserInfoModal';

interface ImageModalProps {
  closeModal: () => void;
}

export default function OrderModal({ closeModal }: ImageModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { data, orderRecord, addMenuItem, deleteMenuItem, totalPrice, deleteMenu, clearOrderData, setError: setOrderError } = useOrderStore();
  const params = useParams();

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

  const [modalImg, setModalImg] = useState<string>();
  const [modalTitle, setModalTitle] = useState<string>();

  const [openModal, setOpenModal] = useState<boolean>(false);

  const openImageModalHander = (image: string, title: string): void => {
    setModalImg(image);
    setModalTitle(title);
    setOpenModal(true);
  }

  const cloaseModalHander = (): void => {
    setOpenModal(false);
  }

  const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);

  const openSuccessModalHander = (): void => {
    setOpenSuccessModal(true);
  }

  const cloaseSuccessModalHander = (): void => {
    setOpenSuccessModal(false);
    handleClose();
    clearOrderData();
  }


  const [openUserInfoModal, setOpenUserInfoModal] = useState<boolean>(false);

  const openUserInfoModalHander = (): void => {
    setOpenUserInfoModal(true);
  }

  const cloaseUserInfoModalHander = (): void => {
    setOpenUserInfoModal(false);
  }

  const { data: tableData } = useTableStore();
  const { data: userData } = useUserStore();

  const calculateVAT = (totalPriceInclVAT: number) => {
    const vatRate = 10; // 10% VAT
    const vatAmount = totalPriceInclVAT / (1 + vatRate / 100);
    return Math.round(totalPriceInclVAT - vatAmount); // VAT amount in centimes
  };

  const calculatePriceExclVAT = (totalPriceInclVAT: number, vatAmount: number) => {
    return totalPriceInclVAT - vatAmount; // Price excluding VAT in centimes
  };

  const [loading, setLoading] = useState(false);
  const [orderDataState, setOrderDataState] = useState<any>();

  const orderHandler = () => {
    if (params?.userID === undefined) {
      setLoading(true);
      setOpenSuccessModal(true);
    }

    const localOrderData = {
      id: uuidv4(),
      type: 0, // 0 for surPlace and 2 for clickAndCollect 
      menusSelection: data,
      table: tableData,
      numberPerson: tableData?.numberCouverts,
      status: 0,
      paiements: [],
      asModificationPaiement: false,
      priceTTC: Math.ceil(Number(totalPrice * 100)),
      priceHT: Math.ceil(calculatePriceExclVAT(totalPrice * 100, calculateVAT(totalPrice * 100))),
      priceTVA: Math.ceil(calculateVAT(totalPrice * 100)),
      isCanceled: false,
      motifCancelation: null,
      isTicketReOpen: false,
      ticketReOpenID: null,
      date: new Date().getTime(),
      nbImpression: 0,
      isFrom: 2,
      ticketNeeded: null,
      serveurId: null,
      serveurName: "AppWeb"
    };

    if (params?.userID) {
      setOrderDataState(localOrderData);
      openUserInfoModalHander();
    } else {
      const userId = params?.slug?.length > 0 && params?.slug[0]

      axios.post('https://europe-west1-miamapp-cc1ca.cloudfunctions.net/sendCommandeToCaisse', { commande: localOrderData }, {
        params: {
          userID: userId,
          serviceID: userData?.servicesEnCours?.idService // Replace with actual service ID
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
    }
  }

  useEffect(() => {
    if (data?.length === 0) {
      handleClose();
    }
  }, [data])

  return (
    <>
      {
        openUserInfoModal ?
          <UserInfoModal data={orderDataState} closeModal={cloaseUserInfoModalHander} closerOrderModal={handleClose} />
          : null}
      {
        openModal ?
          <ImageModal imageUrl={modalImg} title={modalTitle} closeModal={cloaseModalHander} />
          : null}
      {
        openSuccessModal ?
          <LoadingModal loading={loading} closeModal={cloaseSuccessModalHander} />
          : null}
      <div className={`z-[100] w-screen h-[calc(100dvh)] flex flex-col justify-between bg-[rgba(255,255,255,1)] top-0 fixed px-[20px] overflow-auto ${isVisible ? 'modal-enter' : 'modal-exit'}`}>
        <div className='w-full flex-1 flex flex-col items-center pt-[30px] relative'>
          <div onClick={handleClose} className='absolute left-[0px] top-[37px] cursor-pointer '>
            <Image unoptimized={true} src={BackIcon} alt='' width={20} height={20} />
          </div>
          <div className='w-[250px] mb-[30px] h-[30px] rounded-[10px] bg-button-gradient text-white flex justify-center items-center gap-2 relative'>
            <p className='text-12'>{`Résumé de votre commande`}</p>
          </div>
          <div className='w-full  flex-1 flex flex-col gap-[20px] overflow-auto max-h-[calc(100dvh-240px)] overflow-x-hidden'>
            {data?.map((menuItem, index) => (
              <OrderItem key={`order-${index}`} menuItem={menuItem} calculateTotalPrice={calculateTotalPrice} deleteMenuItem={deleteMenuItem} addMenuItem={addMenuItem} openImageModalHander={openImageModalHander} deleteMenu={deleteMenu} />
            ))}
          </div>
        </div>
        <div>
          <div className='flex justify-between w-full pt-[20px]'>
            <p className='text-14 font-bold text-primaryText-light underline'>Total :</p>
            <p className='text-14 font-bold text-primaryText-light underline'>{`${totalPrice.toFixed(2)} €`}</p>
          </div>
          <button disabled={data?.length === 0} onClick={orderHandler} className={`m-auto w-[250px] h-[40px] rounded-[10px] bg-button-gradient text-white flex justify-center items-center gap-2 mt-[30px] mb-[30px] ${data?.length === 0 ? 'opacity-70' : ''}`}>
            Confirmer
          </button>
        </div>
      </div>
    </>
  );
}
