import React from 'react'
import { Button, Typography } from '@mui/material'

import { MainButtonProps } from './main-button.types'
export const MainButton: React.FC<MainButtonProps & { subText?: string }> = ({
  children,
  leftMargin = true,
  endIcon,
  disabled,
  onClick,
  subText,
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
        minHeight: '90px',
        maxHeight: '90px',
        fontWeight: 600,
        textTransform: 'none',
        whiteSpace: 'nowrap',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',

        '&:hover': {
          backgroundColor: '#1f1f1f',
        },
        '& .MuiButton-endIcon': {
          marginLeft: '0.5rem',
        },
        fontSize: '1.125rem',
        '@media (max-width:1280px)': {
          fontSize: '12px',
        },
        ...props.sx,
      }}
      {...props}
    >
      {/* Main text */}
      <Typography component="span" sx={{ lineHeight: 1 }}>
        {children}
      </Typography>

      {/* Secondary smaller text below */}
      {subText && (
        <Typography
          component="span"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.7)',
            whiteSpace: 'normal',
            alignSelf: 'flex-start',
            width: '100%',
            textAlign: 'left',
          }}
        >
          {subText}
        </Typography>
      )}
    </Button>
  )
}
