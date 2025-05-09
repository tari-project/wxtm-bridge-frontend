import React from 'react'
import { Controller } from 'react-hook-form'
import { TextField } from '@mui/material'

import { BridgeInputProps } from './bridge-input.types'
import { useBridgeInfo } from '@/hooks/use-bridge-info'
import { config } from '@/config'

export const BridgeInput: React.FC<BridgeInputProps> = ({
  fromNetwork,
  control,
  errors,
}) => {
  const { fromToken } = useBridgeInfo(fromNetwork)

  return (
    <Controller
      name="amount"
      control={control}
      rules={{
        required: 'Amount is required',
        min: {
          value: config.MIN_BRIDGE_AMOUNT,
          message: `Min amount is ${config.MIN_BRIDGE_AMOUNT} ${fromToken}`,
        },
        max: {
          value: config.MAX_BRIDGE_AMOUNT,
          message: `Maximum amount is ${config.MAX_BRIDGE_AMOUNT} ${fromToken}`,
        },
        pattern: {
          value: /^\d+(\.\d{0,6})?$/,
          message: 'Maximum 6 decimal places allowed',
        },
      }}
      render={({ field }) => (
        <TextField
          {...field}
          type="number"
          variant="standard"
          error={Boolean(errors.amount)}
          helperText={errors.amount?.message}
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
