import React, { useState, useEffect, useRef } from 'react';
import { format, setMinutes, setHours, isBefore, addMinutes, addHours } from 'date-fns';
import './ScrollableTabs.css';
import useUserStore from '@/store/user';

const TimePicker = ({ selectedTime, setSelectedTime }: any) => {
  const [hourOptions, setHourOptions] = useState<number[]>([]);
  const [minuteOptions, setMinuteOptions] = useState<number[]>([]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const [currentHour, setCurrentHour] = useState<number | null>(null);
  const [currentMinute, setCurrentMinute] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const hourRef = useRef<HTMLDivElement | null>(null);
  const minuteRef = useRef<HTMLDivElement | null>(null);

  const { data: userData } = useUserStore();

  useEffect(() => {
    generateTimeOptions();
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);

    const intervalId = setInterval(() => {
      checkAndUpdateSelectedTime();
    }, 5000);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      clearInterval(intervalId);
    };
  }, [selectedTime, hourOptions, minuteOptions]);

  useEffect(() => {
    if (selectedHour !== null && selectedMinute !== null) {
      setSelectedTime(format(setMinutes(setHours(new Date(), selectedHour), selectedMinute), 'HH:mm'));
    }
  }, [selectedHour, selectedMinute]);

  useEffect(() => {
    if (hourRef.current && selectedHour !== null) {
      const element = hourRef.current.querySelector(`[data-hour="${selectedHour}"]`);
      if (element) {
        element.scrollIntoView({ block: 'center' });
      }
    }
  }, [selectedHour, isOpen]);

  useEffect(() => {
    if (minuteRef.current && selectedMinute !== null) {
      const element2 = minuteRef.current.querySelector(`[data-minute="${selectedMinute}"]`);
      if (element2) {
        element2.scrollIntoView({ block: 'center' });
      }
    }
  }, [selectedMinute, isOpen]);

  const generateTimeOptions = () => {
    const hours: number[] = Array.from({ length: userData?.hourMax + 1 }, (_, i) => i);
    const minutes: number[] = Array.from({ length: 12 }, (_, i) => i * 5);

    setHourOptions(hours);
    setMinuteOptions(minutes);

    const nearestTime = findNearestTime(hours, minutes);
    setSelectedHour(nearestTime.hour);
    setCurrentHour(nearestTime.hour);
    setSelectedMinute(nearestTime.minute);
    setCurrentMinute(nearestTime.minute);
  };

  const checkTimeLimit = () => {
    const minutes: number[] = userData?.hourMax === selectedHour ? Array.from({ length: (30 / 5) + 1 }, (_, i) => i * 5) : Array.from({ length: 12 }, (_, i) => i * 5);
    setMinuteOptions(minutes);
  };

  useEffect(() => {
    checkTimeLimit();
  }, [selectedHour]);

  const findNearestTime = (hours: number[], minutes: number[]) => {
    const now = new Date();
    let nearestTime = addMinutes(now, 15);
    let nearestHour = nearestTime.getHours();
    let nearestMinute = nearestTime.getMinutes();

    if (nearestMinute % 5 !== 0) {
      nearestMinute = Math.ceil(nearestMinute / 5) * 5;
    }

    if (nearestMinute === 60) {
      nearestMinute = 0;
      nearestTime = addHours(nearestTime, 1);
      nearestHour = nearestTime.getHours();
    }

    return {
      hour: nearestHour % 24,
      minute: nearestMinute
    };
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const checkAndUpdateSelectedTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const dateClickAndCollect = new Date();
    dateClickAndCollect.setHours(selectedHour ?? 0);
    dateClickAndCollect.setMinutes(selectedMinute ?? 0);
    dateClickAndCollect.setSeconds(0);
    //console.log('dateClickAndCollect', now, dateClickAndCollect);
    if (now.getTime() >= dateClickAndCollect.getTime()) {
      const nearestTime = findNearestTime(hourOptions, minuteOptions);
      setSelectedHour(nearestTime.hour);
      setCurrentHour(nearestTime.hour);
      setSelectedMinute(nearestTime.minute);
      setCurrentMinute(nearestTime.minute);
    }
  };


  return (
    <div ref={dropdownRef} className="relative focus:outline-none flex flex-col justify-center items-center w-[130px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-input-gradient outline-none w-[130px] h-[30px] border border-[#303C9933] rounded-lg text-primaryText-light font-semibold text-13 text-center"
      >
        {selectedTime}
      </button>
      {isOpen ? (
        <div
          className="no-scrollbar bg-input-gradient w-[130px] dropdown-content absolute top-full border rounded-lg bg-white mt-2 max-h-48 shadow-lg left-0 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row justify-center gap-4">
            <div className="no-scrollbar flex flex-col max-h-48 overflow-y-auto" ref={hourRef}>
              {hourOptions.map((hour, index) => {
                const now = new Date();
                const optionTime = setMinutes(setHours(new Date(), hour), currentMinute || 0);
                const isPast = isBefore(optionTime, addMinutes(now, 15));

                return (
                  <div
                    key={index}
                    data-hour={hour}
                    className={`px-4 py-[5px] text-13 font-semibold cursor-pointer flex justify-center gap-4 ${selectedHour === hour ? 'bg-white mx-2 rounded-lg' : ''} ${isPast ? 'text-red-500' : 'text-blue-900'}`}
                    onClick={() => {
                      if (!isPast) {
                        if (hour === currentHour && (selectedMinute !== null && currentMinute !== null && selectedMinute <= currentMinute)) {
                          setSelectedMinute(currentMinute);
                        }
                        setSelectedHour(hour);
                      }
                    }}
                  >
                    {hour}
                  </div>
                );
              })}
            </div>
            <div className="no-scrollbar flex flex-col max-h-48 overflow-y-auto" ref={minuteRef}>
              {minuteOptions.map((minute, index) => {
                const now = new Date();
                const optionTime = setMinutes(setHours(new Date(), selectedHour || 0), minute);
                const isPast = isBefore(optionTime, addMinutes(now, 15));

                return (
                  <div
                    key={index}
                    data-minute={minute}
                    className={`px-4 py-[5px] text-13 font-semibold cursor-pointer flex justify-center gap-4 ${selectedMinute === minute ? 'bg-white mx-2 rounded-lg' : ''} ${isPast ? 'text-red-500' : 'text-blue-900'}`}
                    onClick={() => {
                      if (!isPast) {
                        setSelectedMinute(minute);
                      }
                    }}
                  >
                    {minute < 10 ? `0${minute}` : minute}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TimePicker;
