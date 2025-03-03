package com.casino.drawn.repository.solana;


import com.casino.drawn.model.User;
import com.casino.drawn.model.solana.DepositTransactions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepositTransactionsRepository extends JpaRepository<DepositTransactions, Integer> {
    boolean existsBySignature(String signature);

    DepositTransactions findByUser(User user);

    List<DepositTransactions> findAllByUser(User user);
}
