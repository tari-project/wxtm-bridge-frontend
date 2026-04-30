import React, { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { TextField, InputAdornment, Button } from '@mui/material'

import { BridgeInputProps } from './bridge-input.types'
import { useBridgeInfo } from '@/hooks/use-bridge-info'
import { config } from '@/config'
import { useTariAccountStore } from '@/store/account'
import { toDecimals } from '@/utils/formatters'

export const BridgeInput = ({ fromNetwork, availableBalance, remainingDailyLimit, isTari }: BridgeInputProps) => {
  const [valueLength, setValueLength] = useState(5)
  const { fromToken } = useBridgeInfo(fromNetwork)
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext()

  const account = useTariAccountStore((state) => state.tariAccount)

  const handleMaxClick = () => {
    let maxValue = availableBalance

    if (isTari) {
      maxValue = toDecimals(availableBalance, config.TARI_DECIMAL_PLACES)
    }

    setValue('amount', maxValue.toString(), { shouldValidate: true })
    setValueLength(maxValue.toString().length)
  }

  // Helper to block invalid keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Home',
      'End',
      '.', // Allow decimal point
    ]
    // Allow Ctrl/Cmd + A,C,V,X for copy/paste/select all
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return
    }
    // Allow digits and allowed keys only
    if (!allowedKeys.includes(e.key) && (e.key < '0' || e.key > '9')) {
      e.preventDefault()
    }
  }

  const handleChange = (onChange: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // Remove non-digit characters except decimal point
    const parts = value.split('.')
    const integerPart = parts[0].replace(/\D/g, '') // digits only
    const decimalPart = parts[1] ? parts[1].replace(/\D/g, '') : ''

    // Limit integer part to max 10 digits
    const limitedInteger = integerPart.slice(0, 10)

    // Reconstruct value with decimal part if any
    if (parts.length > 1) {
      value = limitedInteger + '.' + decimalPart
    } else {
      value = limitedInteger
    }

    setValueLength(value.length)
    onChange(value)
  }

  const getFontSize = (length: number) => {
    if (length < 10) return '22px'
    if (length < 14) return '18px'
    if (length < 18) return '14px'
    return '10px'
  }

  const helperText = errors.amount?.message

  return (
    <Controller
      name="amount"
      control={control}
      rules={{
        min: {
          value: config.MIN_BRIDGE_AMOUNT,
          message: `Min amount is ${config.MIN_BRIDGE_AMOUNT.toLocaleString()} ${fromToken}`,
        },
        max: {
          value: config.MAX_BRIDGE_AMOUNT,
          message: `Max amount is ${config.MAX_BRIDGE_AMOUNT} ${fromToken}`,
        },
        pattern: {
          value: /^\d+(\.\d{0,6})?$/,
          message: 'Max 6 decimal places allowed',
        },
        validate: (value) => {
          if (value === '' || value === undefined) {
            return 'Amount is required'
          }
          const amount = parseFloat(value)
          if (isNaN(amount)) {
            return 'Amount must be a valid number'
          }
          if (amount > config.MAX_BRIDGE_AMOUNT) {
            return `Max amount is ${config.MAX_BRIDGE_AMOUNT} ${fromToken}`
          }
          if (isTari && amount > toDecimals(availableBalance, config.TARI_DECIMAL_PLACES)) {
            return `Not enough ${fromToken}`
          }
          if (!isTari && amount > availableBalance) {
            return `Not enough ${fromToken}`
          }
          if (remainingDailyLimit !== undefined && amount > remainingDailyLimit) {
            return `Daily limit exceeded. Remaining: ${remainingDailyLimit.toLocaleString()} XTM`
          }
          return true
        },
      }}
      render={({ field }) => (
        <TextField
          {...field}
          type="number"
          variant="standard"
          placeholder="0"
          error={Boolean(errors.amount)}
          helperText={helperText as React.ReactNode}
          onKeyDown={handleKeyDown}
          onChange={handleChange(field.onChange)}
          InputProps={{
            disableUnderline: true,
            inputMode: 'decimal',
            style: {
              fontSize: getFontSize(valueLength),
              fontWeight: 500,
              minWidth: '180px',
              width: '100%',
              padding: 0,
              appearance: 'textfield',
            },
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={handleMaxClick}
                  sx={{
                    marginRight: '-10px',
                    zIndex: 1,
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'none',
                    minWidth: 'unset',
                    padding: '2px 8px',
                    backgroundColor: 'transparent',
                    border: '1px solid #888',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      border: '1px solid #888',
                    },
                  }}
                >
                  Max
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputBase-input': {
              appearance: 'textfield',
              '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                appearance: 'none',
                margin: 0,
              },
            },
            '& .Mui-error': {
              fontSize: '11px',
              marginTop: '2px',
              '@media (max-width:1280px)': {
                fontSize: '9px',
              },
            },
          }}
        />
      )}
    />
  )
}
