package com.casino.drawn.Repository.Solana;


import com.casino.drawn.Model.Solana.WithdrawTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WithdrawTransactionsRepository extends JpaRepository<WithdrawTransaction, Integer> {

}
