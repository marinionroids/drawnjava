package com.casino.drawn.repository.solana;


import com.casino.drawn.model.User;
import com.casino.drawn.model.solana.WithdrawTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawTransactionsRepository extends JpaRepository<WithdrawTransaction, Integer> {

    List<WithdrawTransaction> findAllByUserId(User userId);
}
