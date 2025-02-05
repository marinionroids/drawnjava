package com.casino.drawn.Repository.Solana;


import com.casino.drawn.Model.Solana.DepositTransactions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepositTransactionsRepository extends JpaRepository<DepositTransactions, Integer> {
    boolean existsBySignature(String signature);
}
