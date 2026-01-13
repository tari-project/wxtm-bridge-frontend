import { create } from 'zustand'

interface ModalStoreState {
  step: number
  isModalOpen: boolean
}

const initialState: ModalStoreState = {
  step: 1,
  isModalOpen: false,
}

export const useModalStore = create<ModalStoreState>()(() => ({ ...initialState }))

export const setModalStep = (step: number) => useModalStore.setState({ step })
export const setIsModalOpen = (isModalOpen: boolean) => useModalStore.setState({ isModalOpen })
