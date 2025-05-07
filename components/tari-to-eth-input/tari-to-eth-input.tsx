import React, { useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { TextField } from '@mui/material'

import { TariToEthInputProps } from './tari-to-eth-input.types'

export const TariToEthInput: React.FC<TariToEthInputProps> = ({
  fromNetwork,
  control,
  errors,
}) => {
  const { tokenSymbol } = useMemo(() => {
    const isFromTari = fromNetwork === 'Tari'
    const tokenSymbol = isFromTari ? 'XTM' : 'wXTM'

    return { isFromTari, tokenSymbol }
  }, [fromNetwork])

  return (
    <Controller
      name="amount"
      control={control}
      rules={{
        required: 'Amount is required',
        min: {
          value: 1,
          message: `Amount must be at least 1 ${tokenSymbol}`,
        },
        max: {
          value: 1000,
          message: `Maximum amount is 1000 ${tokenSymbol}`,
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
                  fontSize: '32px',
                  fontWeight: 500,
                  width: '130px',
                  padding: 0,
                  appearance: 'textfield',
                },
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
              fontSize: '12px',
            },
          }}
        />
      )}
    />
  )
}
