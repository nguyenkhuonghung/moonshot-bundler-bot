import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { ComputeBudgetProgram, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import fs from 'fs'
import path from 'path'

type Ctx = { connection: Connection, wallet: Keypair, logger: any, dryRun: boolean }

export type BundleConfig = {
  priorityMicrolamports?: number
  actions: Array<
    | { kind: 'createAta', mint: string, owner?: string }
    | { kind: 'transferSol', to: string, amountSol: string }
    | { kind: 'swapPlaceholder', pool: string, inMint: string, outMint: string, amountSol: string }
  >
}

export class Bundler {
  private readonly ctx: Ctx
  constructor(ctx: Ctx) { this.ctx = ctx }

  async run(configPath: string) {
    const cfg = this.loadCfg(configPath)
    const ixs: TransactionInstruction[] = []

    // Priority fee (optional)
    const pri = cfg.priorityMicrolamports ?? 0
    if (pri > 0) {
      ixs.push(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: pri }))
      ixs.push(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }))
    }

    for (const action of cfg.actions) {
      if (action.kind === 'createAta') {
        const mint = new PublicKey(action.mint)
        const owner = action.owner ? new PublicKey(action.owner) : this.ctx.wallet.publicKey
        const ata = await getAssociatedTokenAddress(mint, owner)
        ixs.push(createAssociatedTokenAccountInstruction(this.ctx.wallet.publicKey, ata, owner, mint))
      }
      if (action.kind === 'transferSol') {
        const lamports = BigInt(Math.floor(parseFloat(action.amountSol) * 1e9))
        ixs.push(SystemProgram.transfer({ fromPubkey: this.ctx.wallet.publicKey, toPubkey: new PublicKey(action.to), lamports }))
      }
      if (action.kind === 'swapPlaceholder') {
        // Placeholder: replace with Moonshot pool swap ix
        // For now, embed a no-op transfer to self to keep shape
        ixs.push(SystemProgram.transfer({ fromPubkey: this.ctx.wallet.publicKey, toPubkey: this.ctx.wallet.publicKey, lamports: 0 }))
      }
    }

    const tx = new Transaction().add(...ixs)

    if (this.ctx.dryRun) {
      this.ctx.logger.info({ actions: cfg.actions.length }, 'DRY RUN: would send bundled tx')
      return
    }

    const sig = await this.ctx.connection.sendTransaction(tx, [this.ctx.wallet], { skipPreflight: true })
    this.ctx.logger.info({ sig }, 'bundle sent')
    await this.ctx.connection.confirmTransaction(sig, 'confirmed')
  }

  private loadCfg(p: string): BundleConfig {
    const resolved = path.resolve(process.cwd(), p)
    return JSON.parse(fs.readFileSync(resolved, 'utf-8'))
  }
}


