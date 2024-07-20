"use client"
import useMenuStore from '@/store/menu';
import useUserStore from '@/store/user';
import Image from 'next/image';
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react';
import AddIcon from '@/assets/AddIcon.svg'
import AddIconRed from '@/assets/AddIconRed.svg'
import DeleteIcon from '@/assets/DeleteIcon.svg'
import ImageModal from '@/components/ImageModal';
import MenuModal from '@/components/MenuModal';
import Link from 'next/link';
import OrderModal from '@/components/OrderModal';
import useOrderStore from '@/store/order';
import { v4 as uuidv4 } from 'uuid';
import Orderinformation from "@/components/Orderinformation";
import ScrollableTabs from "@/components/ScrollableTabs";
// import Loader from '@/assets/Loader.svg'
import useTableStore from '@/store/table';
import Loader from '@/components/Loader';
import LoaderChargement from '@/assets/chargementLoad.gif';

export default function Page() {
  const params = useParams();

  const { error: tableError, setError: setTableError } = useTableStore();
  const { data, loading: menuLoading, fetchData: fetchMenuData, error: menuError, setError: setMenuError } = useMenuStore();
  const { data: orderData, orderRecord, addMenuItem, deleteMenuItem, error: orderError, setError: setOrderError } = useOrderStore();
  const { data: userData, loading: userLoading, fetchData, error: userError, setError: setUserError } = useUserStore();

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

  const [selectedMenuItem, setSelectedMenuItem] = useState<any>();
  const [openMenuModal, setOpenMenuModal] = useState<boolean>(false);

  const openMenuModalHander = (menuItem: any): void => {
    if (menuItem?.options && menuItem?.options?.length > 0 && ((menuItem?.options[0]?.isSelectedByDefault === false || menuItem?.options[0]?.isSelectedByDefault === null || menuItem?.options?.length > 1))) {
      setSelectedMenuItem(menuItem);
      setOpenMenuModal(true);
    } else {
      const data = {
        menu: menuItem,
        options: menuItem?.options?.length > 0 && menuItem?.options[0]?.isSelectedByDefault ?
          [{
            "titre": menuItem?.options[0]?.option1,
            "price": menuItem?.options[0]?.price_option1,
            "required": menuItem?.options[0]?.isRequired,
            "number": 1,
            "idOptionGroup": menuItem?.options[0]?.id,
            "titreGroup": menuItem?.options[0]?.titre
          }]
          : null,
        number: 1,
        id: uuidv4(),
        isSend: false as false,
      };

      addMenuItem(data);
    }
  }

  const cloaseMenuModalHander = (): void => {
    setOpenMenuModal(false);
  }

  const [openOrderModal, setOpenOrderModal] = useState<boolean>(false);

  const openOrderModalHander = (): void => {
    setOpenOrderModal(true);
  }
  const closeOrderModalHander = (): void => {
    setOpenOrderModal(false);
  }


  useEffect(() => {
    if (fetchData && params?.slug?.length > 0 && params?.slug[0]) {
      fetchData(params.slug[0])
    }
  }, [fetchData, params.slug[0]])

  useEffect(() => {
    if (fetchMenuData && params?.slug?.length > 0 && params?.slug[0]) {
      fetchMenuData(params.slug[0])
    }
  }, [fetchMenuData, params.slug[0]])

  if (userLoading) {
    return (
      <div className='w-full h-[100dvh] flex justify-center items-center'>
         <Image width={100} height={100} src={LoaderChargement} alt="" className="w-[100px] h-[100px]" />
        {/*<Loader />*/}
      </div>
    )
  }
  //console.log('orderData', orderData);
  // if (userData?.servicesEnCours === null) {
  //   return (<div className='w-full h-[100dvh] flex justify-center items-center text-center p-[20px]'>
  //     <p className='font-bold text-primaryText-light text-20 text-center'>Réessayez lorsque le restaurant est ouvert</p>
  //   </div>)
  // }

  return (
    <>
      {
        openModal ?
          <ImageModal imageUrl={modalImg} title={modalTitle} closeModal={cloaseModalHander} /> : null
      }
      {
        openMenuModal ?
          <MenuModal menuItem={selectedMenuItem} closeModal={cloaseMenuModalHander} /> : null
      }
      {
        openOrderModal ?
          <OrderModal closeModal={closeOrderModalHander} /> : null
      }
      <>
        <section className="">
          <div className={`bg-hero-image bg-cover bg-center w-full h-[51.2vw] max-h-[200px] flex flex-col justify-center`}>
            <div className="bg-[rgba(0,0,0,0.2)] w-full h-[51.2vw] max-h-[200px] absolute"></div>
            <div className='flex flex-col justify-center h-[75px] w-full bg-[rgba(255,255,255,0.8)] relative'>
              <h1 className="font-bold text-primaryText-light text-20 text-center">{userData?.pseudo}</h1>
              <p className="font-medium text-secondaryText-light text-12 text-center">{userData?.ville}</p>
            </div>
          </div>
        </section>
        {userData?.servicesEnCours === null ?
          <div className='w-full h-[calc(100dvh-51.2vw)] flex justify-center items-center text-center p-[20px]'>
            <p className='font-bold text-primaryText-light text-20 text-center'>Réessayez lorsque le restaurant est ouvert</p>
          </div>
          : userError || menuError || orderError || tableError ?
            <div className='w-full h-[calc(100dvh-51.2vw)] flex justify-center items-center text-center p-[20px]'>
              <p className='font-bold text-primaryText-light text-20 text-center'>Une erreur c’est produite pendant votre commande veulliez réessayer</p>
            </div>
            : <>
              <Orderinformation />
              <ScrollableTabs />
              <section className='pt-[10px] relative z-[10] w-full'>
                <div key={data?.activeTab} className={`relative z-[10] px-[20px] overflow-auto ${orderData?.length ? 'max-h-[calc(100dvh-420px)]' : 'max-h-[calc(100dvh-325px)]'}`}>
                  {menuLoading === false ? data?.menu?.filter((row: any) => row?.type === data?.activeTab).map((menuItem: any) => {
                    return (
                      <div style={menuItem?.dispo === false ? { pointerEvents: 'none' } : {}} onClick={() => openMenuModalHander(menuItem)} className='py-[10px] flex justify-between items-center' key={menuItem.id}>
                        <div className='flex flex-col gap-1'>
                          <h2 className={`w-[170px] text-12 font-bold ${menuItem?.dispo === false ? 'text-[#EA5959]' : 'text-primaryText-light'}`}>{menuItem?.titre}</h2>
                          <p className={`w-[170px] text-8 font-semibold ${menuItem?.dispo === false ? 'text-[#EA5959]' : 'text-secondaryText-light '} break-words`}>{menuItem?.description}</p>
                          <p className={`text-10 font-bold ${menuItem?.dispo === false ? 'text-[#EA5959]' : 'text-[#303C99]'}`}>{`${(menuItem?.price).toFixed(2)} €`}</p>
                        </div>
                        <div className='flex items-center gap-[20px]'>
                          <div className='relative z-[10]'>
                            {
                              orderRecord[menuItem.id] ?
                                <p className='absolute top-[-5px] right-[-5px] border-2 border-white text-10 text-white bg-button-gradient rounded-full w-[20px] h-[20px] flex justify-center items-center'>{orderRecord[menuItem.id]}</p> : null
                            }
                            {menuItem?.urls?.length > 0 && menuItem?.urls[0]?.url ?
                              menuItem?.dispo === false ?
                                <div className='w-[80px] h-[80px] relative'>
                                  <div className='rounded-[5px] absolute w-[80px] h-[80px] top-0 left-0 bg-[#EA5959a0] z-[11]'>
                                    <p className='bg-white text-[6px] leading-[9px] text-center w-[95%] h-[15px] text-[#EA5959] flex justify-center items-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-[5px]'>Non disponible</p>
                                  </div>
                                  <img
                                    onClick={(e) => { openImageModalHander(menuItem?.urls?.length > 0 && menuItem?.urls[0]?.url, menuItem?.titre); e.stopPropagation() }}
                                    src={menuItem?.urls?.length > 0 && menuItem?.urls[0]?.url}
                                    alt=''
                                    className='relative z-[10] rounded-[5px] w-[80px] h-[80px] object-cover aspect-square' />
                                </div>
                                :
                                <img
                                  onClick={(e) => { openImageModalHander(menuItem?.urls?.length > 0 && menuItem?.urls[0]?.url, menuItem?.titre); e.stopPropagation() }}
                                  src={menuItem?.urls?.length > 0 && menuItem?.urls[0]?.url}
                                  alt=''
                                  className='rounded-[5px] w-[80px] h-[80px] object-cover aspect-square' />
                              : null}
                          </div>
                          <div className='flex flex-col gap-[20px]'>
                            <Image src={menuItem?.dispo === false ? AddIconRed : AddIcon} alt='' width={20} height={20} className='w-[20px] h-[20px] object-cover aspect-square' />
                            {
                              orderRecord[menuItem.id] ?
                                <Image onClick={(e) => { deleteMenuItem(menuItem.id); e.stopPropagation() }} src={DeleteIcon} alt='' width={18} height={20} className='w-[18px] h-[20px] object-cover aspect-square' /> : null
                            }
                          </div>
                        </div>
                      </div>
                    )
                  }) :
                    <div className='w-full m-auto flex justify-center'>
                      <Image width={100} height={100} src={LoaderChargement} alt="" className="w-[100px] h-[100px]" />
                      {/*<Loader />*/}
                    </div>
                  }
                </div>
                <div className={`bg-white fixed bottom-0 w-full cart-button-container ${orderData?.length ? 'visible z-[50]' : 'z-[1]'}`}>
                  <button onClick={openOrderModalHander} className='m-auto w-[250px] h-[40px] rounded-[10px] bg-button-gradient text-white flex justify-center items-center gap-2 mt-[30px] mb-[30px]'>
                    Voir le panier [{orderData?.reduce((acc: number, item: any) => acc + item?.number, 0) || 0}]
                  </button>
                </div>
              </section>
            </>}
      </>
    </>
  );
}
