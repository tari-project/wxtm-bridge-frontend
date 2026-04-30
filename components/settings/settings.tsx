import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { TextField } from '@mui/material'

export const SlippageSettings = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium">Slippage Tolerance</div>
      <Controller
        name="slippage"
        control={control}
        defaultValue="0.5"
        rules={{
          required: 'Slippage is required',
          min: {
            value: 0,
            message: 'Slippage cannot be negative',
          },
          max: {
            value: 10,
            message: 'Max slippage is 10%',
          },
          pattern: {
            value: /^(0(\.\d{1,2})?|([1-9](\d)?(\.\d{1,2})?))$/,
            message: 'Invalid slippage format',
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            variant="outlined"
            placeholder="0.5"
            error={Boolean(errors.slippage)}
            helperText={errors.slippage?.message as React.ReactNode}
            sx={{
              width: '100px',
              '& .MuiInputBase-input': {
                padding: '8px 12px',
              },
            }}
          />
        )}
      />
    </div>
  )
}
