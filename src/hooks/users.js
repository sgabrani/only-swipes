import { useToast } from "@chakra-ui/react";
import { collection, doc, query, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useState } from "react";
import {
    useCollectionData,
    useDocumentData,
  } from "react-firebase-hooks/firestore";
  import { useNavigate } from "react-router-dom";
import { type } from "@testing-library/user-event/dist/type";

export function useUser(id){
    const q = query(doc(db, "users", id));
    const [user, isLoading] = useDocumentData(q);

    return {user, isLoading}
}


export function useCheckFriend(uid, seconduid){
    const q = query(doc(db, "users", uid));
    const [user, isLoading] = useDocumentData(q);
    const isFriend = false;

    console.log(user.friends);

    for(var i = 0; i < user.friends.length; i++){
        if(user.friends[i] === seconduid){
            isFriend = true;
        }
      }
    return {isFriend, isLoading}
}

export function useUsers() {
    const [users, isLoading] = useCollectionData(collection(db, "users"));
    return { users, isLoading };
  }

export function useFriends(uid) {
    const q = query(doc(db, "users", uid));
    const [user, isLoading] = useDocumentData(q);
    const friends = user.friends;
    return {friends, isLoading}
  }






export function useUpdateFriends(uid, friendID, isFriend){
    const [isLoading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    async function updateFriends() {
      setLoading(true); 
        const docUserRef = doc(db, "users", uid);
        const docFriendRef = doc(db, "users", friendID);

        await updateDoc(docUserRef, {friends: isFriend ? arrayRemove(friendID) : arrayUnion(friendID)});
        await updateDoc(docFriendRef, {friends: isFriend ? arrayRemove(uid) : arrayUnion(uid)});
    

      toast({
        title: "Friend added successfully!",
        status: "success",
        isClosable: true,
        position: "top",
        duration: 5000,
      });
      navigate(0);
      setLoading(false);
    }
    return {updateFriends, isLoading}
}

export function getFriends(user){
    user.friends.array.forEach(element => {
        console.log(element);
    });

    return
}

export function useUpdateAvatar(uid) {
    const [isLoading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const toast = useToast();
    const navigate = useNavigate();
  
    async function updateAvatar() {
      if (!file) {
        toast({
          title: "No file selected",
          description: "Please select a file to upload",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
  
        return;
      }
  
      setLoading(true);
  
      const fileRef = ref(storage, "avatars/" + uid);
      await uploadBytes(fileRef, file);
  
        // getting the file url from the database
      const avatarURL = await getDownloadURL(fileRef);
      

      // updating the user object with the new avatar
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, { avatar: avatarURL });
  
      toast({
        title: "Profile updated!",
        status: "success",
        isClosable: true,
        position: "top",
        duration: 5000,
      });
      setLoading(false);
  
      navigate(0);
    }
  
    return {
      setFile,
      updateAvatar,
      isLoading,
      fileURL: file && URL.createObjectURL(file),
    };
  }