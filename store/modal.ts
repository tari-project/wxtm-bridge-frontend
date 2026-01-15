import { create } from 'zustand'

interface ModalStoreState {
  modalStep: number
  isModalOpen: boolean
}

const initialState: ModalStoreState = {
  modalStep: 1,
  isModalOpen: false,
}

export const useModalStore = create<ModalStoreState>()(() => ({ ...initialState }))

export const setModalStep = (modalStep: number) => useModalStore.setState({ modalStep })
export const setIsModalOpen = (isModalOpen: boolean) => useModalStore.setState({ isModalOpen })
