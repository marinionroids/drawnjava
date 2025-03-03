package com.casino.drawn.Repository;


import com.casino.drawn.Model.User;
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
