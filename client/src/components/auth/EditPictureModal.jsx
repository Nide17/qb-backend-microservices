import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, UncontrolledTooltip } from 'reactstrap'
import uploadimage from '../../images/uploadimage.svg'
import { updateProfileImage } from '../../redux/slices/authSlice'
import { useSelector, useDispatch } from "react-redux"
import ImageWithFallback from '../../utils/ImageWithFallback'

const EditPictureModal = ({ bgColor, clr }) => {

  const dispatch = useDispatch()

  // Get the user id and image from the auth
  const auth = useSelector(state => state.auth)
  const currentUser = auth && auth.user
  const uId = currentUser && currentUser._id
  const userImage = currentUser && currentUser.image
  const [profileImageState, setProfileImageState] = useState()
  
  //properties of the modal
  const [modal, setModal] = useState(false)

  //showing and hiding modal
  const toggle = () => setModal(!modal)

  const onFileHandler = (e) => {
    if (currentUser) { // Check if currentUser is not null
      setProfileImageState(e.target.files[0]);
    }
  }

  const onSubmitHandler = e => {
    e.preventDefault()

    const formData = new FormData()

    // VALIDATE
    if (!profileImageState) {
      notify('The image is required!')
      return
    }

    // upload profile image
    formData.append('profile_image', profileImageState)

    // Attempt to upload
    dispatch(updateProfileImage({ formData, uId }))
  }

  return (
    <>
      <span className='upload-image' onClick={toggle} style={{ borderRadius: '50%', backgroundColor: bgColor, color: clr, border: '3px solid #ffc107' }}>
        <ImageWithFallback
          src={userImage}
          fallbackSrc={uploadimage}
          alt="profile illustration"
          id="UncontrolledTooltipExample"
        />

        <UncontrolledTooltip placement="bottom" target="UncontrolledTooltipExample" >
          Click to update profile image
        </UncontrolledTooltip>
      </span>

      <Modal isOpen={modal} toggle={toggle} className="resources-modal">

        <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
          Update profile picture
          <Button className="btn-danger text-uppercase text-red" style={{ padding: "0.1rem 0.3rem", fontSize: ".6rem", fontWeight: "bold" }} onClick={toggle}>
            X
          </Button>
        </div>

        <ModalBody>
          <Form onSubmit={onSubmitHandler} encType='multipart/form-data'>
            <FormGroup>

              <Label for="profile_image" className="my-2">
                <strong>Upload picture</strong>&nbsp;
                <small className="text-info"> (.jpg, .jpeg, .png, .svg)</small>
              </Label>

              <Input bsSize="sm" type="file" accept=".jpg, .jpeg, .png, .svg" name="profile_image" onChange={onFileHandler} label="Choose an image to upload ..." id="profile_image_pick" className='pb-2' />

              <Button style={{ marginTop: '2rem', backgroundColor: "#157A6E", color: "#fff" }} block >Upload</Button>

            </FormGroup>

          </Form>
        </ModalBody>
      </Modal>
    </>
  )
}

export default EditPictureModal
