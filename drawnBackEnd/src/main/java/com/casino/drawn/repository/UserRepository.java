package com.casino.drawn.repository;


import com.casino.drawn.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByUsername(String username);
    boolean existsByPrimaryWalletAddress(String WalletAddress);
    User findByUserId(Integer userId);
    User findByPrimaryWalletAddress(String walletAddress);

    User findByRecieverAddress(String recieverAddress);
}
