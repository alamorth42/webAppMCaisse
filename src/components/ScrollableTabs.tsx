'use client'
import React, { useEffect, useState } from 'react';
import "./ScrollableTabs.css";
import useTableStore from '@/store/table';
import useMenuStore from '@/store/menu';

// const tabs: any = [
//   { id: 1, title: 'Tab 1', content: 'Content for Tab 1' },
//   { id: 2, title: 'Tab 2', content: 'Content for Tab 2' },
//   { id: 3, title: 'Tab 3', content: 'Content for Tab 3' },
//   { id: 4, title: 'Tab 4', content: 'Content for Tab 4' },
//   { id: 5, title: 'Tab 5', content: 'Content for Tab 5' },
//   { id: 6, title: 'Tab 6', content: 'Content for Tab 6' },
// ];

const ScrollableTabs = () => {
  const { data, activeTabHandler } = useMenuStore()

  return (
    <div className="flex flex-col mx-4 items-center">
      <div className="w-full overflow-x-auto scroll no-scrollbar">
        <div className="flex flex-nowrap py-2">
          {data?.tabs?.map((tab: string, index: number) => (
            <button
              key={`${tab}${index}`}
              onClick={() => activeTabHandler(tab)}
              className={`px-4 py-2 whitespace-nowrap ${data.activeTab === tab
                ? 'border-b-2 border-[#101433] text-[#101433]'
                : 'border-b-2 border-[#303C994D] text-[#10143380]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollableTabs;
