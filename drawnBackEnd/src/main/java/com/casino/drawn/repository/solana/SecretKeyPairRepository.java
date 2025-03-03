package com.casino.drawn.Repository.Solana;


import com.casino.drawn.Model.Solana.SecretKeyPair;
import com.casino.drawn.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecretKeyPairRepository extends JpaRepository<SecretKeyPair, Integer> {
    SecretKeyPair findByUser(User user);
    SecretKeyPair findById(int id);
}
