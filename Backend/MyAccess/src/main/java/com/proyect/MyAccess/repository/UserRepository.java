package com.proyect.MyAccess.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.proyect.MyAccess.entity.User;

import java.util.*;


public interface  UserRepository extends JpaRepository <User, Long>{
   List <User> findByRole_NameRole(String nameRole);
   List <User> findByDocument(String document);
 }

