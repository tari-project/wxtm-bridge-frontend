import styled from 'styled-components'
import * as m from 'motion/react-m'
import { Typography } from './Typography'

// TODO REFACTOR IF THEME SUPPORTED
export const ItemWrapper = styled(m.div)`
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 10px;
  padding: 6px 0;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #f3f3f3;
  border: 1px;
  border-color: #e5e7eb;
`

export const HoverWrapper = styled(m.div)`
  position: absolute;
  inset: 0;
  z-index: 4;
  transition: background-color 1s ease;
  backgroundcolor: rgba(0, 0, 0, 0.5);
  height: 100%;
  backdrop-filter: blur(1.5px);
`

export const ContentWrapper = styled.div`
  width: 100%;
  padding: 0 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
`

export const Content = styled.div`
  display: flex;
  gap: 4px;
  flex-direction: row;
  align-items: center;
  height: 100%;
`

export const BlockInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
`
export const TitleWrapper = styled(Typography)`
  display: flex;
  color: #000;

  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.24px;
`
export const TimeWrapper = styled(Typography)`
  display: flex;

  font-size: 11px;
  background-color: #f3f3f3;
`
export const ValueWrapper = styled.div`
  display: flex;
  gap: 3px;
  font-weight: 500;
  justify-content: flex-end;
  align-items: baseline;
`
export const Chip = styled.div`
  display: flex;
  align-self: center;
  justify-content: center;
  align-items: center;

  text-transform: uppercase;
  border-radius: 50px;
  background-color: #126537;

  height: 14px;
  padding: 0 7px;

  color: #fff;
  text-align: center;
  font-family: Poppins, sans-serif;
  font-size: 8px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;

  span {
    display: flex;
    align-items: center;
    line-height: 1;
  }
`

export const CurrencyText = styled(Typography).attrs({ variant: 'p' })`
  display: flex;
  font-size: 11px;
  font-weight: 500;
  color: #000;
`

export const ValueChangeWrapper = styled.div<{ $isPositiveValue?: boolean }>`
  display: flex;
  line-height: 11px;
  color: #000;
`

export const ReplayButton = styled.button`
  display: flex;
  border-radius: 100%;
  position: relative;
  width: 31px;
  height: 31px;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: #000;
  box-sizing: border-box;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  svg {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
`

export const ButtonWrapper = styled(m.div)`
  position: relative;
  align-items: center;
  display: flex;
  flex-direction: row;
  padding: 0 10px;
  justify-content: flex-end;
  height: 100%;
  gap: 6px;
`
export const FlexButton = styled.button`
  display: flex;
  height: 31px;
  padding: 8px 5px 8px 18px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 159px;
  background: linear-gradient(0deg, #c9eb00 0%, #c9eb00 100%),
    linear-gradient(180deg, #755cff 0%, #2946d9 100%),
    linear-gradient(180deg, #ff84a4 0%, #d92958 100%);

  position: relative;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
`

export const GemPill = styled.div`
  border-radius: 60px;
  background: #000;
  justify-content: center;
  display: flex;
  height: 20px;
  padding: 0 5px 0 8px;
  align-items: center;
  gap: 4px;

  span {
    color: #fff;
    display: flex;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.1;
  }
`

export const GemImage = styled.img`
  width: 11px;
`

export const PlaceholderItem = styled.div<{ $isLast?: boolean }>`
  width: 100%;
  height: ${({ $isLast }) => ($isLast ? '35px' : '48px')};
  background: #f3f3f3;
  border-radius: 10px;
  flex-shrink: 0;
  opacity: ${({ $isLast }) => ($isLast ? 0 : 0.75)};
`

export const ListItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  gap: 4px;
  padding: 6px 0 0;
`

export const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

  width: 100%;
  height: 100%;

  h6 {
    text-align: center;
  }
`

export const HistoryListWrapper = styled(m.div)`
  display: flex;
  width: 100%;
  height: 240px;
  flex-grow: 1;
  overflow: hidden;
  overflow-y: auto;
  align-items: flex-end;
  justify-content: flex-end;
  position: relative;
  mask-image: linear-gradient(
    to bottom,
    transparent -10px,
    black 10px,
    black calc(100% - 40px),
    transparent 100%
  );
  mask-position: bottom;
  mask-size: 50% 100%;
  ::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  * {
    box-sizing: border-box;

    ::-webkit-scrollbar {
      display: none;
    }

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  @media (max-height: 815px) {
    height: 140px;
  }
  @media (max-height: 690px) {
    height: 100px;
  }
`
