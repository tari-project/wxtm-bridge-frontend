import React from 'react'
import { Button } from '@mui/material'

import { MainButtonProps } from './main-button.types'

export const MainButton: React.FC<MainButtonProps> = ({
  children,
  leftMargin = true,
  endIcon,
  disabled,
  onClick,
  ...props
}) => {
  return (
    <Button
      variant="contained"
      disabled={disabled}
      endIcon={endIcon}
      onClick={onClick}
      sx={{
        marginLeft: leftMargin ? '1.5rem' : '0',
        backgroundColor: '#090719',
        borderRadius: '0.75rem',
        padding: '1.5rem 2rem',
        height: '100%',
        fontWeight: 600,
        textTransform: 'none',
        whiteSpace: 'nowrap',
        '&:hover': {
          backgroundColor: '#1f1f1f',
        },
        '& .MuiButton-endIcon': {
          marginLeft: '0.5rem',
        },
        fontSize: '1.125rem',
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Button>
  )
}
