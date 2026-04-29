import React from 'react'
import { Controller } from 'react-hook-form'
import { Button, TextField } from '@mui/material'

import { BridgeInputProps } from './bridge-input.types'
import { useBridgeInfo } from '@/hooks/use-bridge-info'
import { config } from '@/config'
import useTariAccount from '@/store/account'

export const BridgeInput: React.FC<BridgeInputProps> = ({
  fromNetwork,
  control,
  errors,
}) => {
  const { fromToken } = useBridgeInfo(fromNetwork)
  const { available_balance } = useTariAccount()

  return (
    <Controller
      name="amount"
      control={control}
      rules={{
        required: 'Amount is required',
        min: {
          value: config.MIN_BRIDGE_AMOUNT,
          message: `You must bridge at least ${config.MIN_BRIDGE_AMOUNT.toLocaleString()} ${fromToken}`,
        },
        max: {
          value: config.MAX_BRIDGE_AMOUNT,
          message: `Maximum amount is ${config.MAX_BRIDGE_AMOUNT} ${fromToken}`,
        },
        pattern: {
          value: /^\d+(\.\d{0,6})?$/,
          message: 'Maximum 6 decimal places allowed',
        },
        validate: (value) => {
          const amount = parseFloat(value)
          if (isNaN(amount)) {
            return 'Amount must be a valid number'
          }
          if (amount > config.MAX_BRIDGE_AMOUNT) {
            return `Maximum amount is ${config.MAX_BRIDGE_AMOUNT} ${fromToken}`
          }
          if (amount > available_balance) {
            return `Amount exceeds your wallet balance`
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
          helperText={errors.amount?.message}
          InputProps={{
            endAdornment: (
              <Button
                onClick={() => field.onChange(100)}
                sx={{
                  color: '#888',
                  fontSize: '14px',
                  minWidth: 'unset',
                  padding: '0 5px',
                  height: '30px',
                }}
              >
                Max
              </Button>
            ),
          }}
          slotProps={{
            input: {
              disableUnderline: true,
              inputProps: {
                style: {
                  fontSize: '30px',
                  fontWeight: 500,
                  width: '130px',
                  padding: 0,
                  appearance: 'textfield',
                },
              },
              style: {
                display: 'flex',
                alignItems: 'center',
                height: '35px',
                paddingTop: '10px',
              },
            },
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
