'use client'
import Image from 'next/image'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const HomeText: React.FC = ({}) => {
  const { t } = useTranslation('main', { useSuspense: false })
  return (
    <div className="flex flex-col gap-8 gap-small">
      <div className="w-[116px] h-[126.07px] relative">
        <Image src="/icons/coin.png" fill sizes="100px" alt="coin icon" className="object-cover" />
      </div>
      <div className="font-normal leading-none text-4xl lg:text-[67px] text-small tracking-tight max-w-[35rem] text-black font-poppins">
        {t('bridge_title_prefix')} <span className="font-semibold">{t('xtm_token')}</span>{' '}
        <span className="hidden short:inline">{t('bridge_title_suffix_inline')}</span>
        <span className="inline short:hidden">{t('bridge_title_suffix_break')}</span>
      </div>
      <div className="font-normal text-lg text-very-small leading-none  tracking-tight max-w-[25rem] lg:max-w-[35rem] whitespace-pre text-black font-poppins lg:text-[27px] lg:leading-[30px] lg:font-normal lg:tracking-[-1px]">
        {t('bridge_description_prefix')}
        <span className="font-semibold">{t('layerzero_oft')}</span> {t('bridge_description_suffix')}
      </div>
    </div>
  )
}
