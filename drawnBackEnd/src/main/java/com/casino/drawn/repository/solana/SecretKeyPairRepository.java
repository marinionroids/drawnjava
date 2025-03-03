package com.casino.drawn.repository.solana;


import com.casino.drawn.model.solana.SecretKeyPair;
import com.casino.drawn.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecretKeyPairRepository extends JpaRepository<SecretKeyPair, Integer> {
    SecretKeyPair findByUser(User user);
    SecretKeyPair findById(int id);
}
